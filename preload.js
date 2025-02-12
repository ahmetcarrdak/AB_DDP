// preload.js
const { contextBridge, ipcRenderer } = require("electron");

// Renderer sürecine güvenli API'ler ekleyin
contextBridge.exposeInMainWorld("electronAPI", {
    sendMessage: (channel, data) => ipcRenderer.send(channel, data),
    onMessage: (channel, func) =>
        ipcRenderer.on(channel, (event, ...args) => func(...args)),
});
