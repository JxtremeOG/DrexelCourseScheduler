// electron.js

const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = true;
const fs = require('fs');
const os = require('os');

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

ipcMain.handle('open-file-dialog', async (event) => {
  try {
    const userDocuments = app.getPath('documents');
    const specificFolder = path.join(userDocuments, '.NewSchedules');

    // Check if the specific folder exists
    let defaultPath;
    if (fs.existsSync(specificFolder)) {
      defaultPath = specificFolder;
    } else {
      defaultPath = userDocuments;
    }

    const { dialog } = require('electron');
    const result = await dialog.showOpenDialog({
      title: 'Select a JSON File',
      defaultPath: defaultPath,
      buttonLabel: 'Open',
      properties: ['openFile'],
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
      ],
    });

    if (result.canceled) {
      return { canceled: true };
    } else {
      const selectedFile = result.filePaths[0];
      return { canceled: false, filePath: selectedFile };
    }
  } catch (error) {
    console.error('Error opening file dialog:', error);
    return { canceled: true, error: error.message };
  }
});

// IPC Handler for reading file content
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    // Validate that the file is a JSON file
    if (path.extname(filePath).toLowerCase() !== '.json') {
      throw new Error('Invalid file type. Please select a JSON file.');
    }

    // Read the file content
    const data = await fs.promises.readFile(filePath, 'utf-8');

    // Parse JSON to ensure it's valid
    const jsonData = JSON.parse(data);

    return { success: true, data: jsonData };
  } catch (error) {
    console.error('Error reading file:', error);
    return { success: false, error: error.message };
  }
});

// **New IPC Handler for Saving Files**
ipcMain.handle('save-file-dialog', async (event, jsonData) => {
  try {
    const userDocuments = app.getPath('documents');
    const specificFolder = path.join(userDocuments, '.NewSchedules');

    // Check if the specific folder exists
    let defaultPath;
    if (fs.existsSync(specificFolder)) {
      defaultPath = specificFolder;
    } else {
      defaultPath = userDocuments;
    }

    const result = await dialog.showSaveDialog({
      title: 'Save JSON File',
      defaultPath: path.join(defaultPath, 'data.json'), // Suggest a default file name
      buttonLabel: 'Save',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
      ],
    });

    if (result.canceled) {
      return { canceled: true };
    } else {
      const savePath = result.filePath;

      // Ensure the file has a .json extension
      if (path.extname(savePath).toLowerCase() !== '.json') {
        throw new Error('File extension must be .json');
      }

      // Write the JSON data to the file
      await fs.promises.writeFile(savePath, JSON.stringify(jsonData, null, 2), 'utf-8');

      return { canceled: false, filePath: savePath };
    }
  } catch (error) {
    console.error('Error saving file:', error);
    return { canceled: true, error: error.message };
  }
});