// Veilige brug tussen de app-pagina en het hoofdproces
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tiktak', {
  load: () => ipcRenderer.invoke('store:load'),
  save: (data) => ipcRenderer.invoke('store:save', data),
  quit: () => ipcRenderer.invoke('app:quit'),
  toggleFullscreen: () => ipcRenderer.invoke('app:fullscreen'),
  isElectron: true
});
