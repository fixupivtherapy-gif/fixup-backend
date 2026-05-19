const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#1a1a1a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Deal',
          accelerator: 'CmdOrCtrl+N',
          click: () => win.webContents.send('menu:new-deal'),
        },
        {
          label: 'Save Deal',
          accelerator: 'CmdOrCtrl+S',
          click: () => win.webContents.send('menu:save-deal'),
        },
        { type: 'separator' },
        {
          label: 'Export Report',
          accelerator: 'CmdOrCtrl+E',
          click: () => win.webContents.send('menu:export'),
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

ipcMain.handle('dialog:save-pdf', async (_event, defaultName) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    defaultPath: defaultName || 'deal-report.html',
    filters: [{ name: 'HTML', extensions: ['html'] }],
  });
  return canceled ? null : filePath;
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
