const { app, BrowserWindow, ipcMain, powerMonitor } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const fs = require("fs");

// 获取资源文件路径
const getAssetPath = (...paths) => {
  if (isDev) {
    return path.join(__dirname, "..", ...paths);
  }
  return path.join(process.resourcesPath, ...paths);
};

// 获取HTML文件路径
const getHtmlPath = () => {
  if (isDev) {
    return "http://localhost:5173";
  }
  return `file://${path.join(app.getAppPath(), "dist/index.html")}`.replace(
    /\\/g,
    "/"
  );
};

let mainWindow = null;
let reminderWindow = null;
let reminderTimer = null;
let defaultReminderInterval = null; // 存储默认提醒间隔

function createMainWindow() {
  // 如果主窗口已存在，则激活它而不是创建新窗口
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    x: 100,
    y: 100,
    frame: false,
    transparent: false,
    resizable: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadURL(getHtmlPath());

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 窗口控制事件处理

  ipcMain.on("window-control", (event, command) => {
    switch (command) {
      case "minimize":
        mainWindow.minimize();
        break;
      case "maximize":
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
        break;
      case "close":
        mainWindow.close();
        break;
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createReminderWindow() {
  // 如果提醒窗口已存在，则激活它而不是创建新窗口
  if (reminderWindow) {
    if (reminderWindow.isMinimized()) {
      reminderWindow.restore();
    }
    reminderWindow.focus();
    return;
  }

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
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const reminderHtmlPath = isDev
    ? "http://localhost:5173/reminder.html"
    : `file://${path.join(app.getAppPath(), "dist/reminder.html")}`.replace(
        /\\/g,
        "/"
      );
  reminderWindow.loadURL(reminderHtmlPath);

  // 监听窗口关闭事件
  reminderWindow.on("closed", () => {
    reminderWindow = null;
  });

  setTimeout(() => {
    if (reminderWindow) {
      reminderWindow.close();
    }
  }, 180000); // 3分钟后自动关闭
}

// 初始化IPC事件处理程序
function setupIpcHandlers() {
  ipcMain.handle("get-background-images", async () => {
    const bgDir = path.join(getAssetPath("assets", "bg"));
    try {
      const files = await fs.promises.readdir(bgDir);
      const images = files.filter((file) => /\.(jpg|jpeg|png)$/i.test(file));
      return images.map((file) => path.join(bgDir, file));
    } catch (error) {
      console.error("Error reading background images:", error);
      return [];
    }
  });

  ipcMain.on("set-reminder-interval", (event, minutes) => {
    if (reminderTimer) {
      clearInterval(reminderTimer);
    }

    defaultReminderInterval = minutes; // 保存默认提醒间隔
    reminderTimer = setInterval(() => {
      createReminderWindow();
    }, minutes * 60 * 1000);
  });

  ipcMain.on("close-reminder", () => {
    if (reminderWindow) {
      reminderWindow.close();
      reminderWindow = null;
    }
  });
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createMainWindow();

  // 监听系统休眠事件
  powerMonitor.on('suspend', () => {
    if (reminderTimer) {
      clearInterval(reminderTimer);
      reminderTimer = null;
    }
    if(reminderWindow){
      reminderWindow.close();
      reminderWindow = null;
    }
  });

  // 监听系统唤醒事件，不自动重启定时器
  powerMonitor.on('resume', () => {
    // 如果存在默认提醒间隔，则自动重启定时器
    if (defaultReminderInterval) {
      reminderTimer = setInterval(() => {
        createReminderWindow();
      }, defaultReminderInterval * 60 * 1000);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (app.isReady()) {
    createMainWindow();
  }
});
