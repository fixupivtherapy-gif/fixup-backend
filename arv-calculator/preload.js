const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onMenuNewDeal: (cb) => ipcRenderer.on('menu:new-deal', cb),
  onMenuSaveDeal: (cb) => ipcRenderer.on('menu:save-deal', cb),
  onMenuExport: (cb) => ipcRenderer.on('menu:export', cb),
  saveReportDialog: (defaultName) => ipcRenderer.invoke('dialog:save-pdf', defaultName),
});
