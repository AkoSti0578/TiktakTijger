// Veilige brug tussen de app-pagina en het hoofdproces
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tiktak', {
  load: () => ipcRenderer.invoke('store:load'),
  save: (data) => ipcRenderer.invoke('store:save', data),
  quit: () => ipcRenderer.invoke('app:quit'),
  toggleFullscreen: () => ipcRenderer.invoke('app:fullscreen'),
  parent: {
    status: () => ipcRenderer.invoke('parent:status'),
    createPin: (pin) => ipcRenderer.invoke('parent:createPin', pin),
    verify: (pin) => ipcRenderer.invoke('parent:verify', pin),
    changePin: (oldPin, newPin) => ipcRenderer.invoke('parent:changePin', oldPin, newPin),
    startTimer: (pin, minutes) => ipcRenderer.invoke('parent:startTimer', pin, minutes),
    addTime: (pin, minutes) => ipcRenderer.invoke('parent:addTime', pin, minutes),
    stopTimer: (pin) => ipcRenderer.invoke('parent:stopTimer', pin),
    on: (event, cb) => {
      const allowed = ['parent:changed', 'parent:expired', 'parent:warn'];
      if (!allowed.includes(event)) return;
      ipcRenderer.on(event, (_e, data) => cb(data));
    }
  },
  isElectron: true
});
