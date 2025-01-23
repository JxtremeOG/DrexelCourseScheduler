// electron.js

const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = true;

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: "Drexel Scheduler",
    width: isDev ? 1000 : 500,
    height: 600,
    frame: false,
    webPreferences: {
        preload: __dirname + '/preload.js',
        nodeIntegration: false,
        contextIsolation: true,
    }
});

  const startUrl = process.env.ELECTRON_START_URL 
    || `file://${path.join(__dirname, 'build', 'index.html')}`;
  mainWindow.loadURL(startUrl);

  if (isDev) {
      try {
          mainWindow.webContents.openDevTools();
      } catch (error) {
          console.error("Failed to open DevTools:", error);
      }
  }

  ipcMain.on('minimize-window', () => {
      mainWindow.minimize();
  });

  ipcMain.on('maximize-window', () => {
      if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
      } else {
          mainWindow.maximize();
      }
  });

  ipcMain.on('close-window', () => {
      mainWindow.close();
  });

  mainWindow.on('maximize', () => {
      mainWindow.webContents.send('window-maximized'); // Notify renderer the window is maximized
  });

  mainWindow.on('unmaximize', () => {
      mainWindow.webContents.send('window-restored'); // Notify renderer the window is restored
  });
}

app.whenReady().then(() => {
  createWindow();

  // On macOS, re-create a window when dock icon is clicked
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
