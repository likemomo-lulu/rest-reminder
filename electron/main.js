const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');


// 获取资源文件路径
const getAssetPath = (...paths) => {
  if (isDev) {
    return path.join(__dirname, '..', ...paths);
  }
  return path.join(process.resourcesPath, ...paths);
};

// 获取HTML文件路径
const getHtmlPath = () => {
  if (isDev) {
    return 'http://localhost:5173';
  }
  return `file://${path.join(__dirname, '../dist/index.html')}`.replace(/\\/g, '/');
};


let mainWindow = null;
let reminderWindow = null;
let reminderTimer = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    x: 100,
    y: 100,
    frame: false,
    transparent:false,
    resizable: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL(getHtmlPath());


  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 窗口控制事件处理
  // 获取背景图片列表
  ipcMain.handle('get-background-images', async () => {
    const bgDir = path.join(getAssetPath('assets', 'bg'));
    console.log('bgDir---',bgDir);
    try {
      const files = await fs.promises.readdir(bgDir);
      console.log('files---',files);
      const images = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));
      return images.map(file => path.join(bgDir, file));
    } catch (error) {
      console.error('Error reading background images:', error);
      return [];
    }
  });

  ipcMain.on('window-control', (event, command) => {
    switch (command) {
      case 'minimize':
        mainWindow.minimize();
        break;
      case 'maximize':
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
        break;
      case 'close':
        mainWindow.close();
        break;
    }
  });

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
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  reminderWindow.loadURL(`${getHtmlPath()}#reminder`);


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