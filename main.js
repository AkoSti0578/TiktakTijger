// Tiktak Tijger - Electron hoofdproces
const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const parental = require('./parental');

let mainWindow = null;
let reallyQuit = false;

const DATA_FILE = () => path.join(app.getPath('userData'), 'tiktak-tijger-data.json');

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE(), 'utf8'));
  } catch (e) {
    return null;
  }
}

function saveData(data) {
  try {
    const file = DATA_FILE();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    // Eerst naar tijdelijk bestand schrijven zodat de voortgang nooit corrupt raakt.
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, file);
    return true;
  } catch (e) {
    console.error('Opslaan mislukt', e);
    return false;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 680,
    title: 'Tiktak Tijger',
    backgroundColor: '#ffb703',
    icon: path.join(__dirname, 'src', 'img', 'icon.png'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  mainWindow = win;

  // Loopt er een ouder-timer? Dan gaat het venster alleen naar de achtergrond.
  win.on('close', (e) => {
    if (!reallyQuit && parental.shouldKeepRunning()) {
      e.preventDefault();
      win.hide();
    }
  });

  // Windows wordt afgesloten of de gebruiker meldt zich af: dan altijd netjes stoppen
  win.on('session-end', () => { reallyQuit = true; });

  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
  });

  // Externe links nooit in de app openen.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e) => e.preventDefault());

  // F11 = volledig scherm, Ctrl+Shift+I = devtools (handig voor ouders/leerkrachten)
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    } else if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      win.webContents.toggleDevTools();
      event.preventDefault();
    } else if (input.control && ['r', 'w', '+', '-', '='].includes(input.key.toLowerCase())) {
      // Voorkom per ongeluk herladen/zoomen tijdens het typen
      event.preventDefault();
    }
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));
}

Menu.setApplicationMenu(null);

ipcMain.handle('store:load', () => loadData());
ipcMain.handle('store:save', (_e, data) => saveData(data));
ipcMain.handle('app:quit', () => {
  if (parental.shouldKeepRunning()) {
    if (mainWindow) mainWindow.hide();
    return 'hidden';
  }
  reallyQuit = true;
  app.quit();
  return 'quit';
});
ipcMain.handle('app:fullscreen', (e) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  if (win) win.setFullScreen(!win.isFullScreen());
});

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    parental.showWindow();
  });
  app.whenReady().then(() => {
    if (process.platform === 'win32') app.setAppUserModelId('nl.tiktaktijger.app');
    parental.init(() => mainWindow);
    createWindow();
  });
  app.on('before-quit', () => { reallyQuit = !parental.shouldKeepRunning(); });
  app.on('window-all-closed', () => { if (!parental.shouldKeepRunning()) app.quit(); });
}
