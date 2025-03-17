const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args)),
    removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback),
  },
  fileHandle: {
    openFile: () => ipcRenderer.invoke('open-file-dialog'),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    saveFile: (jsonData) => ipcRenderer.invoke('save-file-dialog', jsonData),
  }
});
