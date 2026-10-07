// Tiktak Tijger - ouder-timer met pincode (hoofdproces)
// De timer loopt in het hoofdproces, zodat hij ook doorloopt als het venster dicht is.
// Als de tijd om is, wordt de laptop geforceerd afgesloten.
const { app, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execFile } = require('child_process');

const FILE = () => path.join(app.getPath('userData'), 'ouder-timer.json');
const WARN_MS = 15 * 1000; // laatste 15 seconden: venster naar voren met aftelling
const MAX_MINUTES = 8 * 60;

let state = { pin: null, endsAt: null, minutes: 0, locked: false };
let getWindow = () => null;
let tray = null;
let expiryTimer = null;
let warnTimer = null;
let checkInterval = null;
let failed = 0;
let blockedUntil = 0;
let shuttingDown = false;

function load() {
  try {
    const d = JSON.parse(fs.readFileSync(FILE(), 'utf8'));
    state = Object.assign(state, d);
  } catch (e) { /* nog geen timer ingesteld */ }
}

function save() {
  try {
    fs.mkdirSync(path.dirname(FILE()), { recursive: true });
    const tmp = FILE() + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
    fs.renameSync(tmp, FILE());
  } catch (e) { console.error('Ouder-timer opslaan mislukt', e); }
}

function hashPin(pin, salt) {
  return crypto.scryptSync(String(pin), salt, 32).toString('hex');
}

function validPin(pin) { return /^\d{4,6}$/.test(String(pin || '')); }

function checkPin(pin) {
  const now = Date.now();
  if (now < blockedUntil) return { ok: false, error: 'blocked', wait: Math.ceil((blockedUntil - now) / 1000) };
  if (!state.pin) return { ok: false, error: 'nopin' };
  const a = Buffer.from(hashPin(pin, state.pin.salt), 'hex');
  const b = Buffer.from(state.pin.hash, 'hex');
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
    failed = 0;
    return { ok: true };
  }
  failed++;
  if (failed >= 5) {
    blockedUntil = now + 60 * 1000;
    failed = 0;
    return { ok: false, error: 'blocked', wait: 60 };
  }
  return { ok: false, error: 'wrong', left: 5 - failed };
}

function isActive() { return !!state.endsAt && !state.locked; }

function status() {
  return { hasPin: !!state.pin, endsAt: isActive() ? state.endsAt : null, minutes: state.minutes, locked: !!state.locked, now: Date.now() };
}

function broadcast() {
  const win = getWindow();
  if (win && !win.isDestroyed()) win.webContents.send('parent:changed', status());
  updateTray();
}

function remainingText() {
  if (!isActive()) return '';
  const ms = Math.max(0, state.endsAt - Date.now());
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function updateTray() {
  if (!tray) return;
  tray.setToolTip(isActive() ? `Tiktak Tijger - speeltijd nog ${remainingText()}` : 'Tiktak Tijger');
}

function ensureTray() {
  if (tray) return;
  try {
    const icon = nativeImage.createFromPath(path.join(__dirname, 'src', 'img', 'icon.png')).resize({ width: 16, height: 16 });
    tray = new Tray(icon);
    tray.setContextMenu(Menu.buildFromTemplate([{ label: 'Tiktak Tijger openen', click: showWindow }]));
    tray.on('click', showWindow);
    updateTray();
  } catch (e) { tray = null; }
}

function destroyTray() {
  if (tray) { tray.destroy(); tray = null; }
}

function showWindow() {
  const win = getWindow();
  if (!win || win.isDestroyed()) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

function shutdownLaptop() {
  if (shuttingDown) return;
  shuttingDown = true;
  if (process.platform === 'win32' && !process.env.TIKTAK_NO_SHUTDOWN) {
    const exe = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'shutdown.exe');
    // /s = afsluiten, /f = programma's geforceerd sluiten, /t 0 = direct
    execFile(exe, ['/s', '/f', '/t', '0'], { windowsHide: true }, (err) => {
      if (err) console.error('Afsluiten mislukt', err);
    });
  } else {
    console.log('[Tiktak Tijger] Tijd is om: laptop zou nu worden afgesloten (alleen op Windows).');
    shuttingDown = false;
  }
}

function expire() {
  clearTimers();
  state.endsAt = null;
  state.locked = true;
  save();
  destroyTray();
  const win = getWindow();
  if (win && !win.isDestroyed()) {
    showWindow();
    win.webContents.send('parent:expired');
  }
  broadcast();
  // Even de tijd geven om het "laptop gaat uit" scherm te tonen
  setTimeout(shutdownLaptop, 5000);
}

function clearTimers() {
  clearTimeout(expiryTimer);
  clearTimeout(warnTimer);
  clearInterval(checkInterval);
  expiryTimer = warnTimer = checkInterval = null;
}

function arm() {
  clearTimers();
  if (!isActive()) { destroyTray(); return; }
  const left = state.endsAt - Date.now();
  if (left <= 0) { expire(); return; }
  ensureTray();
  // setTimeout kan na slaapstand te laat zijn, daarom ook elke 10 seconden controleren
  expiryTimer = setTimeout(expire, Math.min(left, 0x7fffffff));
  if (left > WARN_MS) {
    warnTimer = setTimeout(() => {
      showWindow();
      const win = getWindow();
      if (win && !win.isDestroyed()) win.webContents.send('parent:warn');
    }, left - WARN_MS);
  }
  checkInterval = setInterval(() => {
    if (isActive() && Date.now() >= state.endsAt) expire();
    else updateTray();
  }, 10000);
}

function init(windowGetter) {
  getWindow = windowGetter;
  load();
  // Was de tijd al om terwijl de app niet draaide? Dan blijft de app op slot.
  if (state.endsAt && !state.locked && Date.now() >= state.endsAt) {
    state.endsAt = null;
    state.locked = true;
    save();
  }
  arm();

  ipcMain.handle('parent:status', () => status());
  ipcMain.handle('parent:createPin', (_e, pin) => {
    if (state.pin) return { ok: false, error: 'exists' };
    if (!validPin(pin)) return { ok: false, error: 'invalid' };
    const salt = crypto.randomBytes(16).toString('hex');
    state.pin = { salt, hash: hashPin(pin, salt) };
    save();
    broadcast();
    return { ok: true, status: status() };
  });
  ipcMain.handle('parent:verify', (_e, pin) => checkPin(pin));
  ipcMain.handle('parent:changePin', (_e, oldPin, newPin) => {
    const c = checkPin(oldPin);
    if (!c.ok) return c;
    if (!validPin(newPin)) return { ok: false, error: 'invalid' };
    const salt = crypto.randomBytes(16).toString('hex');
    state.pin = { salt, hash: hashPin(newPin, salt) };
    save();
    return { ok: true };
  });
  ipcMain.handle('parent:startTimer', (_e, pin, minutes) => {
    const c = checkPin(pin);
    if (!c.ok) return c;
    const m = Math.round(Number(minutes));
    if (!(m >= 1 && m <= MAX_MINUTES)) return { ok: false, error: 'minutes' };
    state.minutes = m;
    state.endsAt = Date.now() + m * 60000;
    state.locked = false;
    shuttingDown = false;
    save();
    arm();
    broadcast();
    return { ok: true, status: status() };
  });
  ipcMain.handle('parent:addTime', (_e, pin, minutes) => {
    const c = checkPin(pin);
    if (!c.ok) return c;
    const m = Math.round(Number(minutes));
    if (!isActive() || !(m >= 1 && m <= MAX_MINUTES)) return { ok: false, error: 'minutes' };
    state.endsAt += m * 60000;
    save();
    arm();
    broadcast();
    return { ok: true, status: status() };
  });
  ipcMain.handle('parent:stopTimer', (_e, pin) => {
    const c = checkPin(pin);
    if (!c.ok) return c;
    state.endsAt = null;
    state.locked = false;
    save();
    arm();
    broadcast();
    return { ok: true, status: status() };
  });
}

// Tijdens een lopende timer mag de app niet gewoon dicht: dan zou het kind de timer ontlopen.
// Het venster verdwijnt naar de achtergrond (systeemvak) en de timer loopt door.
function shouldKeepRunning() { return isActive(); }

module.exports = { init, shouldKeepRunning, showWindow };
