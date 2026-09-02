const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

let mainWindow = null;

// Portable Mode: If running as portable executable, store cache/temp in self-contained directory
const isPortable = !!process.env.PORTABLE_EXECUTABLE_DIR || process.argv.includes('--portable');
if (isPortable) {
  const portableDataDir = path.join(process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath), 'cryptoimg_data');
  app.setPath('userData', portableDataDir);
  app.setPath('sessionData', path.join(portableDataDir, 'session'));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: isPortable ? 'Cryptoimg Desktop v5.1 (Portable Edition)' : 'Cryptoimg Desktop v5.1',
    backgroundColor: '#020617', // slate-950
    autoHideMenuBar: true,
    titleBarStyle: 'default',
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  // Open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:') || url.startsWith('bitcoin:') || url.startsWith('ethereum:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
