const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow = null;
let reminderWindow = null;
let reminderTimer = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../dist/index.html')}`
  );

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createReminderWindow() {
  reminderWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  reminderWindow.loadURL(
    isDev
      ? 'http://localhost:5173/#/reminder'
      : `file://${path.join(__dirname, '../dist/index.html#reminder')}`
  );

  setTimeout(() => {
    if (reminderWindow) {
      reminderWindow.close();
      reminderWindow = null;
    }
  }, 180000); // 3分钟后自动关闭
}

app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

ipcMain.on('set-reminder-interval', (event, minutes) => {
  if (reminderTimer) {
    clearInterval(reminderTimer);
  }

  reminderTimer = setInterval(() => {
    createReminderWindow();
  }, minutes * 60 * 1000);
});

ipcMain.on('close-reminder', () => {
  if (reminderWindow) {
    reminderWindow.close();
    reminderWindow = null;
  }
});